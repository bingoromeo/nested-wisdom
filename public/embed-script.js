<script>
  async function sendMessage(character, message) {
    const inputBox = document.getElementById("chat-input");
    const chatColumn = character === "Lily" ? document.getElementById("lily-column") : document.getElementById("bingo-column");

    // User message bubble
    const userBubble = document.createElement("div");
    userBubble.className = `bubble user-${character.toLowerCase()}`;
    userBubble.innerText = message;
    chatColumn.appendChild(userBubble);

    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ character, message })
      });

      const data = await response.json();

      const replyBubble = document.createElement("div");
      replyBubble.className = `bubble ${character.toLowerCase()}`;
      replyBubble.innerText = data.reply || "No reply received.";
      chatColumn.appendChild(replyBubble);
    } catch (err) {
      const errorBubble = document.createElement("div");
      errorBubble.className = `bubble ${character.toLowerCase()}`;
      errorBubble.innerText = "Error getting reply.";
      chatColumn.appendChild(errorBubble);
      console.error(err);
    }

    inputBox.value = "";
  }
</script>
