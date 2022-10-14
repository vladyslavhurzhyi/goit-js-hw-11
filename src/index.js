import { refs } from './js/refs';
import Notiflix from 'notiflix';
import { PixabayAPI } from './js/PixabayAPI';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { createMarkup } from './js/createMarkup';
import { addMarkup } from './js/createMarkup';
import { slowScroll } from './js/slowScroll';

const pixabayAPI = new PixabayAPI();

const handleSubmit = async (event) => {
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
    const data = await pixabayAPI.getPhotos();

    if (data.totalHits === 0) {
        Notiflix.Notify.failure(
            'Sorry, there are no images matching your search query. Please try again.'
        );
    } else {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images..`);
    }
    refs.form.reset();

    const markup = createMarkup(data);
    addMarkup(markup);
};

// ______________________

refs.form.addEventListener('submit', handleSubmit);

// ________simple____

export let lightbox = new SimpleLightbox('.photo-card a');

// ________load more____

refs.loadMore.addEventListener('click', loadMorePhoto);

async function loadMorePhoto() {
    pixabayAPI.incrementPage();
    const data = await pixabayAPI.getPhotos();
    const markup = createMarkup(data);
    addMarkup(markup);
    slowScroll();
}

// ________clear page____

function clearPage() {
    pixabayAPI.decrementPage();
    refs.gallery.innerHTML = '';
}
