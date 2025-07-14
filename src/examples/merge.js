function getRandomEmail() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const name = Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `${name}@gmail.com`;
}

function getRandomNumber() {
  return `${Math.floor(Math.random() * 100000000)}`;
}
async function callIdentifyService() {
  const url = "http://localhost:3000/identify";

  const email1 = getRandomEmail();
  const email2 = getRandomEmail();
  const phone1 = getRandomNumber();
  const phone2 = getRandomNumber();

  const requests = [
    { email: email1, phoneNumber: phone1 },
    { email: email2, phoneNumber: phone2 },
    { email: email1, phoneNumber: phone2 },
  ];

  for (const req of requests) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      console.log("Request: ", req, "\nResponse: ", data);
    } catch (err) {
      console.error("There was an error: ", err);
    }
  }
}

callIdentifyService();
