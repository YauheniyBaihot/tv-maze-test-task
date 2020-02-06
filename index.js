// TODO: add cache skip check sum

import { TvMazeApi } from './tv-maze-api.js';

(function () {
    const personsPerPage = 2;

    const api = new TvMazeApi('https://api.tvmaze.com');

    const domNodes = {
        searchInput: document.querySelector('.search-bar__input'),
        searchButton: document.querySelector('.search-bar__button'),
        showTemplate: document.querySelector('#tv-show-template'),
        nothingFoundTemplate: document.querySelector('#nothing-found'),
        castMemberTemplate: document.querySelector('#tv-show-cast-member-template'),
    }

    domNodes.searchInput.addEventListener('keydown', (event) => {
        if (event.keyCode === 13) {
            handleSearch();
        };
    });

    domNodes.searchButton.addEventListener('click', handleSearch);
    document.addEventListener('click', handleCastMembersPaging)

    async function handleSearch() {
        const query = domNodes.searchInput.value;
        if (query) {
            const searchResult = await api.searchShows(query);
            renderSearchResults(searchResult,query);
        }
    }

    function handleCastMembersPaging(event) {
        const target = event.target;

        if (target.classList.contains('cast__paging-button')) {
            const parent = target.parentElement;
            const showCastNode = parent.querySelector('.cast');
            const currentPage = showCastNode.dataset.currentPage || 0;
            let newPage = currentPage;

            if (target.dataset.target === 'forward') {
                newPage++;
                const pagesCount = Math.ceil(showCastNode.dataset.count / personsPerPage);

                if (newPage === pagesCount - 1) {
                    target.disabled = true;
                }

                parent.querySelector('[data-target="backward"]').disabled = false;
            } else if (target.dataset.target === 'backward') {
                newPage--;

                if (newPage === 0) {
                    target.disabled = true;
                }

                parent.querySelector('[data-target="forward"]').disabled = false;
            }

            showCastNode.dataset.currentPage = newPage;
            showCastNode.style.right = newPage * 100 + '%';
        }
    }

    function renderSearchResults(data, query) {
        const searchResultsNode = document.querySelector('.app__search-results') || document.createElement('div');

        // Remove search results of previous search.
        while (searchResultsNode.firstChild) {
            searchResultsNode.removeChild(searchResultsNode.firstChild);
        }

        if (data.length === 0) {
            searchResultsNode.appendChild(generateNoResultsNode(query));
        } else {
            data.forEach(show => searchResultsNode.appendChild(generateShowNode(show)));
        }

        if (!document.body.contains(searchResultsNode)) {
            searchResultsNode.className = 'app__search-results'
            document.body.appendChild(searchResultsNode);
        }
    }

    function generateShowNode(show) {
        const showNode = domNodes.showTemplate.content.cloneNode(true);
        showNode.querySelector('a').setAttribute('href', show.url);
        showNode.querySelector('img').setAttribute('src', show.image ? show.image.medium : '/no-image.png');
        showNode.querySelector('.tv-show__url').setAttribute('href', show.url);
        showNode.querySelector('.tv-show__name').textContent = show.name;
        showNode.querySelector('.tv-show__network-type').textContent = show.network ? 'Network:' : 'Web channel:';
        showNode.querySelector('.tv-show__network-name').textContent = show.network ? show.network.name : show.webChannel.name;
        showNode.querySelector('.tv-show__status').textContent = show.status;
        showNode.querySelector('.tv-show__type').textContent = show.type;
        showNode.querySelector('.tv-show__genres').textContent = show.genres.join(' | ');
        showNode.querySelector('.tv-show__premiered').textContent = show.premiered;
        showNode.querySelector('.tv-show__rating').textContent = show.rating.average;
        showNode.querySelector('.tv-show__summary').innerHTML = show.summary;


        const tvShowCastNode = showNode.querySelector('.tv-show__cast');
        if (show.cast.length === 0) {
            tvShowCastNode.remove();

            return showNode;
        }

        const castNode = showNode.querySelector('.cast');
        castNode.dataset.count = show.cast.length;

        if (show.cast.length < personsPerPage) {
            tvShowCastNode.querySelectorAll('button').forEach(e => e.remove());
        }

        show.cast.forEach(entry => castNode.appendChild(generateCastMemberNode(entry)));

        return showNode;
    }

    function generateCastMemberNode(member) {
        const castMemberNode = domNodes.castMemberTemplate.content.cloneNode(true);
        castMemberNode.querySelector('img').setAttribute('src', member.person.image ? member.person.image.medium : '/no-image.png');
        castMemberNode.querySelector('.name').innerHTML = member.person.name;
        castMemberNode.querySelector('.role').innerHTML = member.character.name;
        castMemberNode.querySelector('.birthday').innerHTML = member.person.birthday;

        return castMemberNode;
    }

    function generateNoResultsNode(query) {
        const node = domNodes.nothingFoundTemplate.content.cloneNode(true);
        node.querySelector('.no-results').innerHTML = query;

        return node;
    }
})()

