<script>
async function sendMessage(character, message) {
  const inputBox = document.getElementById("chat-input");
  const chatColumn = character === "Lily"
    ? document.getElementById("lily-column")
    : document.getElementById("bingo-column");

  const userBubble = document.createElement("div");
  userBubble.className = `bubble user-${character.toLowerCase()}`;
  userBubble.innerText = message;
  chatColumn.appendChild(userBubble);

  let data;

  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ character, message })
    });

    if (!response.ok) throw new Error(`Server returned ${response.status}`);

    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Expected JSON, got: " + contentType);
    }

    data = await response.json();
  } catch (err) {
    console.error("Error:", err);
    data = { reply: "Oops! Something went wrong." };
  }

  const replyBubble = document.createElement("div");
  replyBubble.className = `bubble ${character.toLowerCase()}`;
  replyBubble.innerText = data.reply || "No reply received.";
  chatColumn.appendChild(replyBubble);
  inputBox.value = "";
}

document.addEventListener("DOMContentLoaded", function () {
  const talkToLily = document.getElementById("talk-to-lily");
  const talkToBingo = document.getElementById("talk-to-bingo");
  const inputBox = document.getElementById("chat-input");

  if (talkToLily) {
    talkToLily.addEventListener("click", () => {
      const input = inputBox.value.trim();
      if (input) sendMessage("Lily", input);
    });
  }

  if (talkToBingo) {
    talkToBingo.addEventListener("click", () => {
      const input = inputBox.value.trim();
      if (input) sendMessage("Bingo", input);
    });
  }

  if (inputBox) {
    inputBox.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (talkToLily) talkToLily.click();
      }
    });
  }
});
</script>
