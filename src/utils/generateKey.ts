export const generateSecureKey = (): string => {
  // Generate a random array of 32 bytes (256 bits)
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  
  // Convert to hexadecimal string
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}; 