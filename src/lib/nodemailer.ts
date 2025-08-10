import nodemailer from 'nodemailer';
import fs from 'fs';
import Handlebars from 'handlebars';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GOOGLE_APP_USER,
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

export const getTemplate = (resetToken: string, templateFileName: string, userName: string) => {
    const templateHtml = fs.readFileSync(`src/templates/${templateFileName}.html`, 'utf-8');
    const compiledTemplateHtml = Handlebars.compile(templateHtml);
    const resultTemplateHtml = compiledTemplateHtml({
        name: userName,
        linkUrl: `${process.env.FRONTEND_RESET_PASSWORD_URL}/${resetToken}`,
    });

    return resultTemplateHtml;
}