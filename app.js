async function sendBulkSTK() {

  const numbersRaw = document
    .getElementById("numbers")
    .value;

  const amount = document
    .getElementById("amount")
    .value;

  const reference = document
    .getElementById("reference")
    .value;

  const description = document
    .getElementById("description")
    .value;

  const numbers = numbersRaw
    .split(/\n|,/)
    .map(n => n.trim())
    .filter(Boolean);

  document.getElementById("results").innerHTML =
    "Processing requests...";

  try {

    const response = await fetch("/bulk-stk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        numbers,
        amount,
        reference,
        description
      })
    });

    const data = await response.json();

    document.getElementById("results").innerHTML =
      JSON.stringify(data, null, 2);

  } catch (error) {

    document.getElementById("results").innerHTML =
      error.message;
  }
}
