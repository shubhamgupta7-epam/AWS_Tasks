exports.handler = async (event) => {
    event.Records.forEach(record => {
        const snsMessage = record.Sns.Message;
        console.log(`Received SNS message: ${snsMessage}`);
    });
    return { statusCode: 200 };
};