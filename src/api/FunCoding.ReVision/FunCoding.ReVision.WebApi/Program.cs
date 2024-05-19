using FunCoding.ReVision.WebApi;
using FunCoding.ReVision.WebApi.Contracts;
using FunCoding.ReVision.WebApi.Services;
using Microsoft.SemanticKernel;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var openAiOptions = builder.Configuration.GetSection(OpenAiOptions.SectionName).Get<OpenAiOptions>();
if (openAiOptions is null)
{
    throw new InvalidOperationException($"Configuration section '{OpenAiOptions.SectionName}' is missing.");
}

// Register Semantic Kernel services
var kernelBuilder = Kernel.CreateBuilder();
kernelBuilder.Services.AddAzureOpenAIChatCompletion(openAiOptions.Model, openAiOptions.Endpoint, openAiOptions.ApiKey);

var kenel = kernelBuilder.Build();
var pluginDirectoryPath = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "Plugins");
kenel.ImportPluginFromPromptDirectory(Path.Combine(pluginDirectoryPath, "SummarizePlugin"));
kenel.ImportPluginFromPromptDirectory(Path.Combine(pluginDirectoryPath, "WriterPlugin"));
builder.Services.AddSingleton(kenel);

// Enable CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(corsPolicyBuilder =>
    {
        // TODO: In production, you should specify the allowed origins.
        corsPolicyBuilder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});


builder.Services.AddScoped<IReVisionService, ReVisionService>();

builder.Configuration.AddUserSecrets<Program>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
