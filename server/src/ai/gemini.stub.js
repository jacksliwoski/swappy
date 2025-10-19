// Placeholder AI module — returns canned suggestions for trades
function priceAdvice(title, category) {
  return {
    suggestedPrice: 25,
    notes: `Stub: suggest fair price for ${title} (${category}).`
  };
}

module.exports = { priceAdvice };
