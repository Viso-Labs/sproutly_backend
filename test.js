const url = 'https://api.x.com/2/users?user.fields=profile_image_url&ids=1120065922092417025';
const options = {
  method: 'GET',
  headers: {
    Authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAAJYt3wEAAAAATs%2BkSXmYPU%2B038cSrwTK904p1sw%3DGn31flGx8aZ2HDIEnRkha7M2t7Ah5dE1EFI2NLXBGysgHz05zQ'
  },
  body: undefined
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}