using FunCoding.ReVision.WebApi;
using FunCoding.ReVision.WebApi.Contracts;
using FunCoding.ReVision.WebApi.Middleware;
using FunCoding.ReVision.WebApi.Services;
using Microsoft.SemanticKernel;
using Serilog;

// Create bootstrap logger for early startup logging
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting ReVision Web API application...");

    var builder = WebApplication.CreateBuilder(args);

    // Configure Serilog with full sinks
    var logPath = Path.Combine(AppContext.BaseDirectory, "logs", "revision-api-.log");
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .WriteTo.File(
            path: logPath,
            rollingInterval: RollingInterval.Day,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}",
            retainedFileCountLimit: 7)
        .WriteTo.ApplicationInsights(
            connectionString: context.Configuration["ApplicationInsights:ConnectionString"],
            telemetryConverter: new Serilog.Sinks.ApplicationInsights.TelemetryConverters.TraceTelemetryConverter()));

    Log.Information("Serilog configured successfully. Log file path: {LogPath}", logPath);


    // Add services to the container.
    builder.Services.AddControllers();
    // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
    builder.Services.AddOpenApi();
    // Add Swagger generation
    builder.Services.AddSwaggerGen();

    var openAiOptions = builder.Configuration.GetSection(nameof(AzureOpenAIOptions)).Get<AzureOpenAIOptions>();
    if (openAiOptions is null)
    {
        throw new InvalidOperationException($"Configuration section '{nameof(AzureOpenAIOptions)}' is missing.");
    }

    Log.Information("Azure OpenAI configuration loaded - Model: {Model}, Endpoint: {Endpoint}",
        openAiOptions.Model, openAiOptions.Endpoint);

    var kernel = Kernel.CreateBuilder()
        .AddAzureOpenAIChatCompletion(openAiOptions.Model, openAiOptions.Endpoint, openAiOptions.ApiKey)
        .Build();

    builder.Services.AddSingleton(kernel);
    builder.Services.AddScoped<IReVisionService, ReVisionService>();

    // Add HttpClient for feedback service
    builder.Services.AddHttpClient();

    // Configure rate limiting
    builder.Services.Configure<RateLimitingOptions>(
        builder.Configuration.GetSection("RateLimiting"));  // Fixed: Use "RateLimiting" to match JSON
    builder.Services.AddMemoryCache();
    builder.Services.AddSingleton<IRateLimitService, InMemoryRateLimitService>();

    Log.Information("Rate limiting configured - Daily limit: {Limit}, Enabled: {Enabled}",
        builder.Configuration.GetValue<int>("RateLimiting:DailyRequestLimit"),
        builder.Configuration.GetValue<bool>("RateLimiting:Enabled"));

    // Add health checks for Azure monitoring
    builder.Services.AddHealthChecks();

    // Enable CORS for specific origin
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(builder =>
        {
            builder.WithOrigins("https://revision.funcoding.nz")
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
    });


    var app = builder.Build();

    Log.Information("Application built successfully. Environment: {Environment}", app.Environment.EnvironmentName);

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        // Minimal OpenAPI endpoint
        app.MapOpenApi();
        // Enable Swagger middleware and UI
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseCors(); // Use the default policy

    // Add rate limiting middleware
    app.UseMiddleware<RateLimitingMiddleware>();

    // Health check endpoint for Azure monitoring
    app.MapHealthChecks("/health");

    app.MapControllers();

    Log.Information("ReVision Web API started successfully. Ready to accept requests.");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
