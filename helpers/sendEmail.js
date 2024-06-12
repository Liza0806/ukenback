const nodemailer = require('nodemailer');


require('dotenv').config();

const { META_PASSWORD } = process.env;
 
const nodemailerConfig = {
    host: 'smtp.ukr.net',
    port: 465,
    secure: true,
    auth: {
        user: 'lizromanova@ukr.net',
        pass: META_PASSWORD,
    },
};

const transporter = nodemailer.createTransport(nodemailerConfig);

const emailOptions = {
    from: 'lizromanova@ukr.net',
    to: 'fildepiorsta@gmail.com',
    subject: 'Test',
    html: '<p>Hello</p>',
};


const sendEmail = async (data) => {
    const email = {
        ...data,
        from: 'lizromanova@ukr.net',
    };
    try {
        await transporter.sendMail(email);
        return true;
    } catch (error) {
        console.error("Error in sending mail", error);
        return false;
    }
}

sendEmail(emailOptions).then((result) => {
    if (result) {
        console.log('The letter was sent successfully');
    } else {
        console.log('Failed to send email');
    }
})
    .catch((error) => {
        console.error('Error:', error);
    });


    module.exports = sendEmail;