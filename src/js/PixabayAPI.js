import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';

export const searchParams = new URLSearchParams({
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
});

const key = 'key=17568064-fe285d9450a7ecb893916a0ce';

export class PixabayAPI {
  #page = 1;
  #per_page = 40;
  #query = '';

  async getPhotos() {
    const urlAXIOS = `?${key}&q=${this.#query}&${searchParams}&page=${
      this.#page
    }&per_page=${this.#per_page}`;
    const { data } = await axios.get(urlAXIOS);
    return data;
  }

  set query(newQuery) {
    this.#query = newQuery;
  }

  get query() {
    return this.#query;
  }

  incrementPage() {
    this.#page += 1;
  }

  decrementPage() {
    this.#page = 1;
  }
}
