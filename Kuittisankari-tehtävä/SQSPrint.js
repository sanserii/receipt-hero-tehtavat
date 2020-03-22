// Pohja SQS vastauksen tulostamiselle, ei työstetty

exports.handler = async function(event, context) {
  event.Records.forEach(record => {
    const { body } = record;
    console.log(body);
  });
  return {};
}