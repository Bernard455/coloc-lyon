import { describe, it, expect, vi, afterEach } from "vitest";
import { sendContactNotification } from "../email";

const originalFetch = global.fetch;
const originalEnv = { ...process.env };

afterEach(() => {
  global.fetch = originalFetch;
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

const sampleInput = {
  firstName: "Marie",
  lastName: "Dupont",
  email: "marie@example.com",
  subject: "Question générale",
  message: "Bonjour, j'ai une question sur le site."
};

describe("sendContactNotification", () => {
  it("n'appelle pas fetch si RESEND_API_KEY est absent", async () => {
    delete process.env.RESEND_API_KEY;
    process.env.CONTACT_NOTIFICATION_EMAIL = "moi@example.com";
    global.fetch = vi.fn();

    await sendContactNotification(sampleInput);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("n'appelle pas fetch si CONTACT_NOTIFICATION_EMAIL est absent", async () => {
    process.env.RESEND_API_KEY = "re_test";
    delete process.env.CONTACT_NOTIFICATION_EMAIL;
    global.fetch = vi.fn();

    await sendContactNotification(sampleInput);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("envoie l'email avec le bon destinataire et reply_to quand tout est configuré", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.CONTACT_NOTIFICATION_EMAIL = "moi@example.com";
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "" } as Response);

    await sendContactNotification(sampleInput);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as any).mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    const body = JSON.parse(options.body);
    expect(body.to).toEqual(["moi@example.com"]);
    expect(body.reply_to).toBe("marie@example.com");
    expect(body.subject).toContain("Question générale");
  });

  it("ne lève pas d'erreur si l'appel réseau échoue", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.CONTACT_NOTIFICATION_EMAIL = "moi@example.com";
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    await expect(sendContactNotification(sampleInput)).resolves.not.toThrow();
  });
});
