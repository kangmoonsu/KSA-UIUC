package com.core.ksa.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class EmailService {

        private final JavaMailSender mailSender;

        public void sendContactEmail(String title, String email, String content, MultipartFile file)
                        throws MessagingException, java.io.UnsupportedEncodingException {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom("contact.michaeldev@gmail.com", email);

                String[] recipients = {
                                "contact.michaeldev@gmail.com",
                                "jensine0421@gmail.com",
                                "gun21630@gmail.com",
                };
                helper.setTo(recipients);
                helper.setReplyTo(email);
                helper.setSubject("[KSA Contact Us 문의: " + title + "]");

                String htmlContent = String.format(
                                "<h3>KSA Contact Us 문의</h3>" +
                                                "<p><strong>From:</strong> %s</p>" +
                                                "<p><strong>Title:</strong> %s</p>" +
                                                "<div><strong>Content:</strong><br/>%s</div>",
                                email, title, content);

                helper.setText(htmlContent, true);

                if (file != null && !file.isEmpty()) {
                        helper.addAttachment(file.getOriginalFilename(), file);
                }

                mailSender.send(message);
        }
}
