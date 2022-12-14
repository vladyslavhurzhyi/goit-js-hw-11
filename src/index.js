import { refs } from './js/refs';
import Notiflix from 'notiflix';
import { PixabayAPI } from './js/PixabayAPI';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { createMarkup } from './js/createMarkup';
import { addMarkup } from './js/createMarkup';
import { slowScroll } from './js/slowScroll';

const pixabayAPI = new PixabayAPI();

// _____________observer_________

const options = {
  root: null,
  rootMargin: '100px',
  threshold: 1,
};

const callback = async function (entries, observer) {
  entries.forEach(async entry => {
    if (entry.isIntersecting && entry.intersectionRect.bottom > 550) {
      pixabayAPI.incrementPage();
      io.unobserve(entry.target);
      try {
        await loadMorePhoto();
      } catch (error) {
        Notiflix.Notify.failure(error.message, 'Oops...something wrong');
        clearPage();
      }
    }
  });
};

const io = new IntersectionObserver(callback, options);

const handleSubmit = async event => {
  event.preventDefault();

  clearPage();
  const {
    elements: { searchQuery },
  } = event.currentTarget;

  const searchValue = searchQuery.value.trim().toLowerCase();

  if (!searchValue) {
    Notiflix.Notify.failure('Введите текст');
    return;
  }

  pixabayAPI.query = searchValue;

  try {
    const data = await pixabayAPI.getPhotos();

    pixabayAPI.totalHits = data.totalHits;

    pixabayAPI.calculateTotalpages();

    if (data.totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    } else {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images..`);
    }
    refs.form.reset();

    const markup = createMarkup(data);
    addMarkup(markup);
    const target = document.querySelector('.photo-card:last-child');
    io.observe(target);
    if (pixabayAPI.page === pixabayAPI.totalPages) {
      io.unobserve(target);
    }
  } catch (error) {
    Notiflix.Notify.failure(error.message, 'Oops...something wrong');
    clearPage();
  }
};

refs.form.addEventListener('submit', handleSubmit);

// ________SimpleLightbox____

export let lightbox = new SimpleLightbox('.photo-card a');

// ________load more____

export async function loadMorePhoto() {
  const data = await pixabayAPI.getPhotos();
  const markup = createMarkup(data);
  addMarkup(markup);
  slowScroll();
  const target = document.querySelector('.photo-card:last-child');
  io.observe(target);

  if (pixabayAPI.page === pixabayAPI.totalPages) {
    io.unobserve(target);
    Notiflix.Notify.success('Вы посмотрели все картинки');
  }
}

// ________clear page____

function clearPage() {
  pixabayAPI.decrementPage();
  refs.gallery.innerHTML = '';
}
