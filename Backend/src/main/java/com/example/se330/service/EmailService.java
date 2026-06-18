package com.example.se330.service;

import jakarta.mail.MessagingException;
import java.util.Objects;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.validation.constraints.NotNull;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    @NotNull
    private String fromEmail = "";

    @Value("${app.base-url}")
    @NotNull
    private String baseUrl = "";

    @Async
    public void sendVerificationEmail(String to, String token) {
        String subject = "Verify your email address";
        String verificationUrl = baseUrl + "/api/auth/verify-email?token=" + token;
        String content = buildVerificationEmailContent(verificationUrl);
        sendEmail(to, subject, content);
    }

    @Async
    public void sendPasswordResetEmail(String to, String token) {
        String subject = "Reset your password";
        String resetUrl = baseUrl + "/reset-password?token=" + token;
        String content = buildPasswordResetEmailContent(resetUrl);
        sendEmail(to, subject, content);
    }

    @Async
    public void sendPasswordResetOtpEmail(String to, String otp) {
        String subject = "Your password reset code";
        String content = buildPasswordResetOtpEmailContent(otp);
        sendEmail(to, subject, content);
    }

    private void sendEmail(String to, String subject, String content) {
        try {
            Objects.requireNonNull(fromEmail, "spring.mail.username must not be null");
            Objects.requireNonNull(to, "recipient (to) must not be null");
            Objects.requireNonNull(subject, "subject must not be null");
            Objects.requireNonNull(content, "content must not be null");
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);

            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildVerificationEmailContent(String verificationUrl) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset=\"UTF-8\">");
        sb.append("<style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        sb.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        sb.append(".header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }");
        sb.append(".content { padding: 30px; background-color: #f9f9f9; }");
        sb.append(".button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; ");
        sb.append("color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }");
        sb.append(".footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }</style></head>");
        sb.append("<body><div class=\"container\">");
        sb.append("<div class=\"header\"><h1>Email Verification</h1></div>");
        sb.append("<div class=\"content\">");
        sb.append("<p>Thank you for registering! Please verify your email address by clicking the button below:</p>");
        sb.append("<div style=\"text-align: center;\">");
        sb.append("<a href=\"").append(verificationUrl).append("\" class=\"button\">Verify Email</a></div>");
        sb.append("<p>Or copy and paste this link into your browser:</p>");
        sb.append("<p style=\"word-break: break-all; color: #666;\">").append(verificationUrl).append("</p>");
        sb.append("<p>This link will expire in 24 hours.</p></div>");
        sb.append("<div class=\"footer\"><p>If you did not create an account, please ignore this email.</p></div>");
        sb.append("</div></body></html>");
        return sb.toString();
    }

    private String buildPasswordResetEmailContent(String resetUrl) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset=\"UTF-8\">");
        sb.append("<style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        sb.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        sb.append(".header { background-color: #f44336; color: white; padding: 20px; text-align: center; }");
        sb.append(".content { padding: 30px; background-color: #f9f9f9; }");
        sb.append(".button { display: inline-block; padding: 12px 30px; background-color: #f44336; ");
        sb.append("color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }");
        sb.append(".footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }</style></head>");
        sb.append("<body><div class=\"container\">");
        sb.append("<div class=\"header\"><h1>Password Reset</h1></div>");
        sb.append("<div class=\"content\">");
        sb.append("<p>You have requested to reset your password. Click the button below to proceed:</p>");
        sb.append("<div style=\"text-align: center;\">");
        sb.append("<a href=\"").append(resetUrl).append("\" class=\"button\">Reset Password</a></div>");
        sb.append("<p>Or copy and paste this link into your browser:</p>");
        sb.append("<p style=\"word-break: break-all; color: #666;\">").append(resetUrl).append("</p>");
        sb.append(
                "<p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p></div>");
        sb.append(
                "<div class=\"footer\"><p>For security reasons, please do not share this link with anyone.</p></div>");
        sb.append("</div></body></html>");
        return sb.toString();
    }

    private String buildPasswordResetOtpEmailContent(String otp) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset=\"UTF-8\">");
        sb.append("<style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        sb.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        sb.append(".header { background-color: #f44336; color: white; padding: 20px; text-align: center; }");
        sb.append(".content { padding: 30px; background-color: #f9f9f9; }");
        sb.append(".otp { display: inline-block; padding: 12px 30px; background-color: #fff; ");
        sb.append("border: 2px dashed #f44336; color: #f44336; font-size: 32px; font-weight: bold; ");
        sb.append("letter-spacing: 8px; border-radius: 5px; margin: 20px 0; }");
        sb.append(".footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }</style></head>");
        sb.append("<body><div class=\"container\">");
        sb.append("<div class=\"header\"><h1>Password Reset</h1></div>");
        sb.append("<div class=\"content\">");
        sb.append("<p>You have requested to reset your password. Use the code below to proceed:</p>");
        sb.append("<div style=\"text-align: center;\">");
        sb.append("<span class=\"otp\">").append(otp).append("</span></div>");
        sb.append(
                "<p>This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p></div>");
        sb.append(
                "<div class=\"footer\"><p>For security reasons, please do not share this code with anyone.</p></div>");
        sb.append("</div></body></html>");
        return sb.toString();
    }
}
