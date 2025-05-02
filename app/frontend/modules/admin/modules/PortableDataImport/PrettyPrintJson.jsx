const getBackgroundColor = (operation) => {
  if (operation === 'Deleted') return '#ffcccc'
  if (operation === 'Added') return '#ccffcc'
  return '#f5f5f5' // Default background color
}

export const PrettyPrintJson = ({ data, operation }) => {
  const preStyle = {
    backgroundColor: getBackgroundColor(operation), // Background color based on operation
    padding: '10px',
    borderRadius: '4px',
    width: '100%', // Utilize full width of the column
    whiteSpace: 'pre-wrap', // Ensure content wraps if necessary
    overflowX: 'auto', // Add horizontal scrolling if content overflows
  }

  try {
    // Handle object data
    if (typeof data === 'object' && data !== null) {
      return <pre style={preStyle}>{JSON.stringify(data, null, 2)}</pre>
    }

    // Handle string data that might be JSON
    if (typeof data === 'string') {
      try {
        const parsedData = JSON.parse(data)
        if (typeof parsedData === 'object' && parsedData !== null) {
          return <pre style={preStyle}>{JSON.stringify(parsedData, null, 2)}</pre>
        }
      } catch (e) {
        // Not valid JSON, fall through to default
      }
    }

    // Default case for non-JSON data
    return <span>{String(data)}</span>
  } catch (error) {
    return <span>{String(data)}</span>
  }
}
