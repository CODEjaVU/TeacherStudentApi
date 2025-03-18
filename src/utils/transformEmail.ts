 const transformEmail = (email : string) => {
    // Extract the username and domain
    const [username, domain] = email.split("@");

    if (username.startsWith("teacher")) {
        const modifiedUsername = username.replace(/^teacher/, "teacher_");

        const newUsername = `student_only_under_${modifiedUsername}`;

        return `${newUsername}@${domain}`;
    }

    return email;
}


export default transformEmail;