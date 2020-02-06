export class TvMazeApi {

    // https://api.tvmaze.com
    constructor(baseUrl) {
        this._baseUrl = baseUrl;
    }

    async searchShows(query) {
        try {
            const url = `${this._baseUrl}/search/shows?q=${query}`;

            const response = await fetch(url);
            const results = await response.json();
            const shows = results.map(result => result.show);

            const casts = await Promise.all(shows.map(async show => {
                const response = await fetch(`${this._baseUrl}/shows/${show.id}/cast`)
                return response.json();
            }));

            casts.forEach((cast, index) => {
                shows[index].cast = cast.sort((a, b) => new Date(a.person.birthday) - new Date(b.person.birthday));
            });

            return shows;
        }
        catch {
            throw 'Error during grabbing remote data';
        }
    }
}