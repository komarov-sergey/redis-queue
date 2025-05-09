const Redis = require('ioredis');

const redis = new Redis({
  host: 'redis',
  port: 6379,
});

const min = parseInt(process.env.MIN) || 1;
const max = parseInt(process.env.MAX) || 100;
const producerCount = parseInt(process.env.PRODUCER_COUNT) || 2;

function generateRandomNumber() {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function produce() {
  const number = generateRandomNumber();
  redis.xadd('numbers', '*', 'number', number.toString());

  console.log(`Produced: ${number}`);

  setTimeout(produce, 100);
}

for (let i = 0; i < producerCount; i++) {
  produce();
}
