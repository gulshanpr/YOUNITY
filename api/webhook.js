export default async function handler(req, res) {
  if (req.method === "POST") {
    const data = req.body;

    console.log("Received webhook:", data);

    res.status(200).json({ status: "success" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
