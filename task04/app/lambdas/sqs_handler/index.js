exports.handler = async (event) => {
    event.Records.forEach(record => {
        console.log(`Received SQS message: ${record.body}`);
    });
    return { statusCode: 200 };
};