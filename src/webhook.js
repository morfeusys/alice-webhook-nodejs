module.exports = (webhook) => {
    webhook
        .on("test", "Тест пройден")
        .on(["", "помощь"], "Просто скажи мне что-нибудь, и я отвечу то же самое в ответ")
        .on("*", (request, response) => {
            response.text = request.command;
        });
};
