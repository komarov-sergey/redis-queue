const Redis = require('ioredis');
const fs = require('fs');

const redis = new Redis({ host: 'redis', port: 6379 });

const min = parseInt(process.env.MIN) || 1;
const max = parseInt(process.env.MAX) || 100;
const totalNumbers = max - min + 1;
const receivedNumbers = new Set();

let startTime = Date.now();

async function consume() {
  const result = await redis.xread('STREAMS', 'numbers', '0');

  if (result) {
    const [_, messages] = result[0];
    for (const [_, fields] of messages) {
      const number = parseInt(fields[1]);

      if (!receivedNumbers.has(number)) {
        receivedNumbers.add(number);

        console.log(`Consumed: ${number}`);

        if (receivedNumbers.size === totalNumbers) {
          const timeSpent = Date.now() - startTime;
          const numbersGenerated = Array.from(receivedNumbers).map((value) => ({
            value,
            date: new Date().toISOString(),
          }));
          const result = { timeSpent, numbersGenerated };

          fs.writeFileSync('result.json', JSON.stringify(result, null, 2));

          console.log('All numbers received. Result saved to result.json');
          process.exit();
        }
      }
    }
  }

  setTimeout(consume, 100);
}

consume();
