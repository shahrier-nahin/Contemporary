import { useEffect, useState } from "react";
import { getCardHistory } from "../services/api";

export default function History({ onSelectCard, refreshKey }) {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    loadHistory();
  }, [refreshKey]);

  async function loadHistory() {
    try {
      const data = await getCardHistory();

      setCards(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div
      style={{
        marginTop: 30,
      }}
    >
      <h3
        style={{
          padding: "0 24px",
          marginBottom: 12,
        }}
      >
        History
      </h3>

      <div
        style={{
          margin: "0px 24px",
          maxHeight: 260,
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: 10,
          background: "#fafafa",
        }}
      >
        {cards.length === 0 ? (
          <div
            style={{
              padding: 15,
              color: "#777",
            }}
          >
            No cards generated yet.
          </div>
        ) : (
          cards.map((card) => (
            <div
              key={card.id}
              onClick={() => onSelectCard(card)}
              style={{
                padding: 12,
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f2f2f2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fafafa";
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 4,
                }}
              >
                {card.headline}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                }}
              >
                {new Date(card.generated_at).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}