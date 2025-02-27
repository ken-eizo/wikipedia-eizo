export const linkifyText = (text, titles) => {
    // 単語の完全一致に対応した正規表現
    const regex = new RegExp(`\\b(${titles.join("|")})\\b`, "g");
    return text.replace(regex, (match) => {
      return `<a href="/articles/${encodeURIComponent(match)}">${match}</a>`;
    });
  };
  