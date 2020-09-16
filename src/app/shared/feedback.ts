export class Feedback {
    firstname: string;
    lastname: string;
    telnum: number;
    email: string;
    agree: boolean;
    contacttype: string;
    message: string;
};


export class Comment{
	author: string;
	rating: number;
    comment: string;
    date: string;

};

export const ContactType = ['None', 'Tel', 'Email'];