function TopRecipientsTable({ data }) {
  return (
    <div className="table-container">
      <h2>top recipients</h2>
      <table className="recipients-table">
        <thead>
          <tr>
            <th>country</th>
            <th>investment (million USD)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((recipient, index) => (
            <tr key={index}>
              <td>{recipient.country}</td>
              <td>${(recipient.investment / 1000000).toFixed(2)}M</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TopRecipientsTable; 