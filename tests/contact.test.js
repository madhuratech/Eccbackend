// tests/contact.test.js
// Tests for POST /api/contact — mocks nodemailer so no real email is sent

jest.mock("../src/config/mailer", () => ({
  sendMail: jest.fn().mockResolvedValue({ messageId: "test-id" }),
  verify: jest.fn((cb) => cb(null)),
}));

const request = require("supertest");
const app = require("../src/server");

const validPayload = {
  fullName: "Test User",
  companyName: "Test Corp",
  email: "test@example.com",
  phone: "9876543210",
  service: "Solar EPC Services",
  location: "Chennai",
  message: "This is a test inquiry.",
};

describe("POST /api/contact", () => {
  it("returns 200 and success:true for valid payload", async () => {
    const res = await request(app).post("/api/contact").send(validPayload);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/sent successfully/i);
  });

  it("returns 400 when fullName is missing", async () => {
    const { fullName, ...payload } = validPayload;
    const res = await request(app).post("/api/contact").send(payload);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when email is missing", async () => {
    const { email, ...payload } = validPayload;
    const res = await request(app).post("/api/contact").send(payload);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when phone is missing", async () => {
    const { phone, ...payload } = validPayload;
    const res = await request(app).post("/api/contact").send(payload);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when message is missing", async () => {
    const { message, ...payload } = validPayload;
    const res = await request(app).post("/api/contact").send(payload);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 500 when nodemailer throws", async () => {
    const transporter = require("../src/config/mailer");
    transporter.sendMail.mockRejectedValueOnce(new Error("SMTP connection failed"));

    const res = await request(app).post("/api/contact").send(validPayload);
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it("GET / returns health check message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/running/i);
  });

  it("GET /api/health returns JSON health check", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Backend is running",
    });
  });

  it("allows production origin during CORS preflight", async () => {
    const res = await request(app)
      .options("/api/contact")
      .set("Origin", "https://madhuraecc.com")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Content-Type");

    expect(res.statusCode).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("https://madhuraecc.com");
  });
});
