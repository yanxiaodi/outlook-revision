/* global setTimeout, console */
import {
  IReVisionService,
  TranslateRequest,
  TranslateResponse,
  GenerateReplyRequest,
  GenerateReplyResponse,
  GenerateComposeRequest,
  GenerateComposeResponse,
  SuggestionRequest,
  SuggestionResponse,
  RevisionRequest,
  RevisionResponse,
  ReVisionServiceResult,
} from "./ReVisionService";

export class MockReVisionService implements IReVisionService {
  constructor() {
    console.log("MockReVisionService initialized");
  }

  /**
   * Get user email for logging (mock service doesn't send to backend)
   */
  private getUserEmail(): string {
    try {
      if (typeof Office !== "undefined" && Office.context?.mailbox?.userProfile?.emailAddress) {
        return Office.context.mailbox.userProfile.emailAddress;
      }
    } catch (error) {
      console.error("[MockReVisionService] Error getting user email:", error);
    }
    return "mock-user@example.com";
  }

  async translateText(
    request: TranslateRequest
  ): Promise<ReVisionServiceResult<TranslateResponse>> {
    console.log(`[MockReVisionService] translateText called by user: ${this.getUserEmail()}`);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // Mock translation logic
      const translations: Record<string, string> = {
        en: "This is a mock translation to English: ",
        es: "Esta es una traducción simulada al español: ",
        fr: "Ceci est une traduction fictive en français: ",
        de: "Dies ist eine Mock-Übersetzung ins Deutsche: ",
        "zh-CN": "这是一个模拟中文翻译：",
        ja: "これは日本語への模擬翻訳です：",
        ko: "이것은 한국어로 번역된 모의 번역입니다: ",
      };

      const prefix =
        translations[request.targetLanguage] || `Mock translation to ${request.targetLanguage}: `;
      const translatedText = `${prefix}${request.emailBody.substring(0, 100)}${request.emailBody.length > 100 ? "..." : ""}`;

      return {
        success: true,
        data: { text: translatedText },
      };
    } catch (error) {
      console.error("Mock translation error:", error);
      return {
        success: false,
        error: "Mock translation service error",
      };
    }
  }

  async generateReply(
    request: GenerateReplyRequest
  ): Promise<ReVisionServiceResult<GenerateReplyResponse>> {
    console.log(`[MockReVisionService] generateReply called by user: ${this.getUserEmail()}`);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Mock reply generation logic
      const replyTemplates: Record<string, string[]> = {
        en: [
          "Thank you for your email. I have reviewed your message and will get back to you shortly with the information you requested.",
          "I appreciate you reaching out. Your message is important to me and I will respond with the details as soon as possible.",
          "Thank you for contacting me. I understand your request and will provide a comprehensive response within the next business day.",
        ],
        es: [
          "Gracias por su correo electrónico. He revisado su mensaje y le responderé en breve con la información solicitada.",
          "Agradezco que se haya puesto en contacto conmigo. Su mensaje es importante para mí y responderé con los detalles lo antes posible.",
          "Gracias por contactarme. Entiendo su solicitud y proporcionaré una respuesta integral dentro del próximo día hábil.",
        ],
        fr: [
          "Merci pour votre e-mail. J'ai examiné votre message et je vous répondrai bientôt avec les informations demandées.",
          "Je vous remercie de m'avoir contacté. Votre message est important pour moi et je répondrai avec les détails dès que possible.",
          "Merci de m'avoir contacté. Je comprends votre demande et fournirai une réponse complète dans le prochain jour ouvrable.",
        ],
        de: [
          "Vielen Dank für Ihre E-Mail. Ich habe Ihre Nachricht überprüft und werde Ihnen in Kürze mit den angeforderten Informationen antworten.",
          "Ich schätze es, dass Sie sich an mich gewandt haben. Ihre Nachricht ist wichtig für mich und ich werde so schnell wie möglich mit den Details antworten.",
          "Vielen Dank, dass Sie mich kontaktiert haben. Ich verstehe Ihre Anfrage und werde innerhalb des nächsten Werktages eine umfassende Antwort geben.",
        ],
        "zh-CN": [
          "感谢您的电子邮件。我已经查看了您的消息，将很快回复您所请求的信息。",
          "感谢您的联系。您的消息对我很重要，我会尽快回复详细信息。",
          "感谢您联系我。我理解您的请求，将在下一个工作日内提供全面的回复。",
        ],
        ja: [
          "メールをありがとうございます。あなたのメッセージを確認しました。ご要求の情報をすぐにお返事いたします。",
          "ご連絡いただきありがとうございます。あなたのメッセージは私にとって重要であり、可能な限り早く詳細をお返事いたします。",
          "ご連絡いただきありがとうございます。あなたのご要求を理解しており、次の営業日以内に包括的な返答を提供いたします。",
        ],
        ko: [
          "이메일을 보내주셔서 감사합니다. 귀하의 메시지를 검토했으며 요청하신 정보를 곧 회신드리겠습니다.",
          "연락해 주셔서 감사합니다. 귀하의 메시지는 저에게 중요하며 가능한 한 빨리 세부 사항을 회신드리겠습니다.",
          "연락해 주셔서 감사합니다. 귀하의 요청을 이해하고 있으며 다음 영업일 내에 포괄적인 답변을 제공하겠습니다.",
        ],
      };

      const templates = replyTemplates[request.language] || replyTemplates["en"];
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

      // Add some context from the original email
      const originalSnippet = request.emailBody.substring(0, 50);
      const contextInfo = request.context ? `\n\nContext: ${request.context}` : "";
      const toneInfo = request.writingTone ? ` (${request.writingTone} tone)` : "";

      const replyText = `${randomTemplate}${toneInfo}${contextInfo}\n\nRegarding: "${originalSnippet}${request.emailBody.length > 50 ? "..." : ""}"\n\nBest regards,\n[Your Name]`;

      return {
        success: true,
        data: { text: replyText },
      };
    } catch (error) {
      console.error("Mock reply generation error:", error);
      return {
        success: false,
        error: "Mock reply generation service error",
      };
    }
  }

  async generateCompose(
    request: GenerateComposeRequest
  ): Promise<ReVisionServiceResult<GenerateComposeResponse>> {
    console.log(`[MockReVisionService] generateCompose called by user: ${this.getUserEmail()}`);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const lang = request.language || "en";
      const tone = request.writingTone || "professional";
      const context = request.context.trim();

      if (!context) {
        return { success: false, error: "Context is required" };
      }

      // Generate a subject that reflects the user's intention
      const intentionKeywords = context.toLowerCase();
      let subject = "New Message";

      if (
        intentionKeywords.includes("请假") ||
        intentionKeywords.includes("leave") ||
        intentionKeywords.includes("不舒服")
      ) {
        subject = lang === "zh-CN" ? "请假申请" : "Leave Request";
      } else if (intentionKeywords.includes("会议") || intentionKeywords.includes("meeting")) {
        subject = lang === "zh-CN" ? "会议安排" : "Meeting Arrangement";
      } else if (intentionKeywords.includes("报告") || intentionKeywords.includes("report")) {
        subject = lang === "zh-CN" ? "工作报告" : "Work Report";
      } else {
        // Use the first few words of the context as subject
        const firstSentence = context.split(/[.!?\n]/)[0]?.trim() || "New message";
        subject = firstSentence.slice(0, 50);
      }

      const openings: Record<string, string> = {
        en: request.recipientName ? `Dear ${request.recipientName},` : "Hello,",
        es: request.recipientName ? `Estimado/a ${request.recipientName},` : "Hola,",
        fr: request.recipientName ? `Cher/Chère ${request.recipientName},` : "Bonjour,",
        de: request.recipientName ? `Liebe/r ${request.recipientName},` : "Hallo,",
        "zh-CN": request.recipientName ? `尊敬的${request.recipientName}，` : "您好，",
        ja: request.recipientName ? `${request.recipientName}様，` : "こんにちは、",
        ko: request.recipientName ? `${request.recipientName}님께，` : "안녕하세요,",
      };

      const signoffs: Record<string, string> = {
        en: "Best regards,\n[Your Name]",
        es: "Saludos cordiales,\n[Tu Nombre]",
        fr: "Cordialement,\n[Votre Nom]",
        de: "Mit freundlichen Grüßen,\n[Ihr Name]",
        "zh-CN": "此致\n敬礼\n[您的姓名]",
        ja: "よろしくお願いいたします。\n[あなたの名前]",
        ko: "감사합니다.\n[귀하의 이름]",
      };

      const opening = openings[lang] || openings.en;
      const signoff = signoffs[lang] || signoffs.en;

      // Transform user's intention into proper email content
      let emailContent = "";
      if (
        intentionKeywords.includes("请假") ||
        intentionKeywords.includes("leave") ||
        intentionKeywords.includes("不舒服")
      ) {
        if (lang === "zh-CN") {
          emailContent = `我因身体不适，需要请假一天。具体情况如下：\n\n${context}\n\n请批准我的请假申请，谢谢。`;
        } else {
          emailContent = `I am writing to request a day off due to health reasons. Details:\n\n${context}\n\nI would appreciate your approval for this leave request.`;
        }
      } else {
        // General case - transform the context into email content
        if (lang === "zh-CN") {
          emailContent = `我想与您分享以下信息：\n\n${context}\n\n期待您的回复。`;
        } else {
          emailContent = `I would like to share the following information with you:\n\n${context}\n\nI look forward to your response.`;
        }
      }

      const body = `${opening}\n\n${emailContent}\n\n(${tone} tone)\n\n${signoff}`;

      return {
        success: true,
        data: { subject, body },
      };
    } catch (error) {
      console.error("Mock compose generation error:", error);
      return { success: false, error: "Mock compose generation service error" };
    }
  }

  async analyzeEmail(
    _request: SuggestionRequest
  ): Promise<ReVisionServiceResult<SuggestionResponse>> {
    console.log(`[MockReVisionService] analyzeEmail called by user: ${this.getUserEmail()}`);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const mockCategories = [
        {
          categoryName: "grammar",
          categoryTitle: "Grammar & Spelling",
          suggestions: [
            {
              id: "grammar-1",
              title: "Grammar Enhancement",
              description:
                "Consider improving sentence structure and verb tenses for better clarity",
              suggestionText:
                "Use active voice instead of passive voice to make sentences more direct and engaging",
              severity: "medium",
              examples: ["Change 'The report was completed by me' to 'I completed the report'"],
              suggestionTextInUserNativeLanguage:
                "Using active voice makes your writing more direct and easier to understand",
            },
            {
              id: "grammar-2",
              title: "Verb Tense Consistency",
              description: "Ensure consistent verb tenses throughout the email",
              suggestionText: "Maintain the same tense when describing related actions or events",
              severity: "high",
              examples: ["Keep past tense: 'I completed the task and submitted the report'"],
              suggestionTextInUserNativeLanguage:
                "Consistent verb tenses make your writing clearer and more professional",
            },
          ],
        },
        {
          categoryName: "tone",
          categoryTitle: "Tone & Style",
          suggestions: [
            {
              id: "tone-1",
              title: "Tone Adjustment",
              description: "The tone could be more professional and polished",
              suggestionText:
                "Add courteous phrases like 'I hope this message finds you well' or 'Thank you for your time'",
              severity: "low",
              examples: ["Add opening pleasantries", "Use more formal closing"],
              suggestionTextInUserNativeLanguage:
                "Professional courtesy phrases help establish rapport and show respect",
            },
          ],
        },
        {
          categoryName: "clarity",
          categoryTitle: "Clarity & Readability",
          suggestions: [
            {
              id: "clarity-1",
              title: "Clarity Improvement",
              description: "Some sentences are unclear and could benefit from simplification",
              suggestionText: "Break down complex sentences into shorter, more digestible ones",
              severity: "high",
              examples: ["Split long compound sentences", "Use simpler vocabulary"],
              suggestionTextInUserNativeLanguage:
                "Clear, concise sentences improve reader comprehension and engagement",
            },
            {
              id: "clarity-2",
              title: "Word Choice Enhancement",
              description: "Consider using more precise and professional vocabulary",
              suggestionText: "Replace vague terms with specific, actionable language",
              severity: "medium",
              examples: ["Change 'soon' to 'by Friday'", "Replace 'things' with specific items"],
              suggestionTextInUserNativeLanguage:
                "Precise language helps readers understand exactly what you mean",
            },
            {
              id: "clarity-3",
              title: "Structure Improvement",
              description: "Reorganize content for better flow and readability",
              suggestionText: "Use bullet points or numbered lists for multiple items",
              severity: "low",
              examples: ["List action items clearly", "Group related information"],
              suggestionTextInUserNativeLanguage:
                "Well-organized content is easier to read and act upon",
            },
          ],
        },
      ];

      return {
        success: true,
        data: {
          overallScore: 7,
          overallAssessment:
            "Your email is well-structured but could benefit from a few improvements to enhance clarity and professionalism.",
          suggestionCategories: mockCategories,
        },
      };
    } catch (error) {
      console.error("Mock analysis error:", error);
      return {
        success: false,
        error: "Mock analysis service error",
      };
    }
  }

  async reviseEmail(request: RevisionRequest): Promise<ReVisionServiceResult<RevisionResponse>> {
    console.log(`[MockReVisionService] reviseEmail called by user: ${this.getUserEmail()}`);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // Mock revision - simply add some improvements to the original text
      const improvements = [
        "I hope this message finds you well. ",
        "Please find the revised content below:\n\n",
        "\n\nThank you for your consideration.",
        "\n\nBest regards,\n[Your Name]",
      ];

      const revisedText =
        improvements[0] +
        improvements[1] +
        request.originalEmailBody +
        improvements[2] +
        improvements[3];

      return {
        success: true,
        data: {
          revisedEmailBody: revisedText,
          appliedSuggestions: request.selectedSuggestions.map((s) => s.title),
          summary: `Applied ${request.selectedSuggestions.length} improvements: enhanced tone, improved clarity, and added professional courtesy phrases.`,
        },
      };
    } catch (error) {
      console.error("Mock revision error:", error);
      return {
        success: false,
        error: "Mock revision service error",
      };
    }
  }
}
