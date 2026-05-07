// tests/mailer.test.js
// Tests for sendContactMail service — mocks nodemailer transporter

jest.mock("../src/config/mailer", () => ({
  sendMail: jest.fn().mockResolvedValue({ messageId: "mock-id-123" }),
  verify: jest.fn((cb) => cb(null)),
}));

const { sendContactMail } = require("../src/services/sendMail");
const transporter = require("../src/config/mailer");

const samplePayload = {
  fullName: "Madhura Test",
  companyName: "ECC Pvt Ltd",
  email: "madhura@example.com",
  phone: "9003663660",
  service: "Solar EPC Services",
  location: "Virudhunagar",
  message: "Need a quote for 100kW solar plant.",
};

describe("sendContactMail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EMAIL_USER = "sender@example.com";
    process.env.CONTACT_TO_EMAIL = "contact@example.com";
  });

  it("calls transporter.sendMail with correct fields", async () => {
    await sendContactMail(samplePayload);

    expect(transporter.sendMail).toHaveBeenCalledTimes(1);

    const callArg = transporter.sendMail.mock.calls[0][0];
    expect(callArg.to).toBe("contact@example.com");
    expect(callArg.replyTo).toBe(samplePayload.email);
    expect(callArg.subject).toContain(samplePayload.fullName);
    expect(callArg.html).toContain(samplePayload.fullName);
    expect(callArg.html).toContain(samplePayload.phone);
    expect(callArg.html).toContain(samplePayload.message);
  });

  it("resolves with messageId on success", async () => {
    const result = await sendContactMail(samplePayload);
    expect(result.messageId).toBe("mock-id-123");
  });

  it("handles optional fields gracefully (companyName, service, location missing)", async () => {
    const minimalPayload = {
      fullName: "No Company",
      email: "nocompany@example.com",
      phone: "1234567890",
      message: "Minimal inquiry.",
    };

    await expect(sendContactMail(minimalPayload)).resolves.not.toThrow();

    const callArg = transporter.sendMail.mock.calls[0][0];
    expect(callArg.html).toContain("-"); // optional fields render as "-"
  });

  it("throws when transporter.sendMail rejects", async () => {
    transporter.sendMail.mockRejectedValueOnce(new Error("Auth failed"));
    await expect(sendContactMail(samplePayload)).rejects.toThrow("Auth failed");
  });

  it("throws when no recipient email is configured", async () => {
    delete process.env.EMAIL_USER;
    delete process.env.CONTACT_TO_EMAIL;

    await expect(sendContactMail(samplePayload)).rejects.toThrow(/must be configured/i);
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });
});
