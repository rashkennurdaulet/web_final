# City Zoo Final Project

Jumabay Saule, Ramazan Mukhan, Nurdaulet Rashken, Saidazimov Mukhammajan · SE-2501

City Zoo is a responsive website for families and groups planning a visit. Visitors can explore the animals, check the map and schedule, estimate ticket costs, and create a Zoo Club demo account.

## Run locally

Extract the archive, open a terminal in the `CityZoo` folder, and run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [localhost:8000](http://127.0.0.1:8000/) in your browser. On Windows, use `py -m http.server 8000 --bind 127.0.0.1` if `python3` is unavailable. Keep the terminal open while using the site.

The site includes Bootstrap, jQuery, images and sounds. The weather and Wildlife Field Notes panels use an internet connection for live data. Field Notes can show a saved fact if the live request fails. Use a sample password for the account demo. Account details and a salted password verifier are stored in this browser's localStorage. The contact form and newsletter also save locally. The ticket wizard produces a demo booking reference.

## What to demonstrate

| Requirement | Where to demonstrate |
| --- | --- |
| Six connected pages | The navigation connects 11 pages. The Visit menu opens Tickets, Schedule, Map and Rules. |
| Responsive design | Use the mobile navigation, animal card grid and ticket wizard at different widths. |
| Light and dark modes | Switch between Light and Dark below the navigation. After signing in, the toolbar and Profile > Preferred appearance save the same account preference. |
| Design and visitor experience | Use the Home shortcuts to view animals and plan a visit. |
| Simulated authentication | Create an account on Sign Up, log in, view the saved details on Profile, then log out. |
| JavaScript validation | Submit empty fields and then try an invalid email, a short password, a mismatched confirmation, or an invalid phone number. Errors appear next to each field. |
| Search and filtering | Select Birds on Animals and search for “macaw”. Reload to show the saved filter, then select Clear filters. |
| Animated interactions | Hover over buttons and animal cards, expand an FAQ, or use the ticket wizard. |
| External APIs | On Home, refresh the Astana weather and try Wildlife Field Notes. Choose an animal group, discover a species and watch the journal progress increase. |
| Cohesion | Combine the weather panel, animal explorer, zoo map and ticket planner into one visit-planning demo. |
| Code organization | Site styling is in `css/style.css`. Account, validation, weather and other behaviors are in separate `js/` files. |
| Team presentation | Demonstrate Home and its theme switch, then Animals, Sign Up → Log In → Profile, and the Tickets wizard. Use a sample account and divide the demo among the team. |

## Wildlife Field Notes and API key

The journal records nine species, grouped into mammals, birds and aquatic animals. It keeps discoveries in localStorage. It uses the Wikipedia species API on static hosting and displays a built-in fact if live data is unavailable.

For the optional keyed [API Ninjas Animals API](https://api-ninjas.com/api/animals), deploy the repository to Netlify using the included `netlify.toml`. Set the environment variable `API_NINJAS_KEY` in the Netlify project settings and redeploy. The server function adds the key in the upstream `X-Api-Key` request header. Keep the value in Netlify's environment settings. The key never appears in browser code. The same site still works on GitHub Pages using Wikipedia and Open-Meteo.

The clock uses Astana time (Asia/Almaty) and the schedule shown on the site: daily opening at 09:00, last entry at 17:00 and closing at 18:00.

## Publish and submit

- Team repository: [rashkennurdaulet/web_final](https://github.com/rashkennurdaulet/web_final.git)
- Existing GitHub Pages URL: [City Zoo](https://muchanroma2501.github.io/webasik6/)
- The ZIP contains the updated version. The existing public site still serves the earlier version.

To publish the final version, copy the contents of the `CityZoo` folder into the root of the team repository so that `index.html` is at the root. Commit and push using an account with write access. Confirm the Pages source in **Settings → Pages** and wait for the deployment to finish. Open the live site and test `login.html`, `profile.html`, and the weather panel before submitting both links.

## Credits

- Weather data by [Open-Meteo](https://open-meteo.com/en/docs). Species notes are attributed next to each result and link to their source.
- Bootstrap, Popper and jQuery licenses are included in `vendor/`.
- [Greater flamingos resting](https://commons.wikimedia.org/wiki/File:Greater_flamingos_(Phoenicopterus_roseus)_resting.jpg) by Charles J. Sharp, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Resized for the site.
- [Scarlet macaw](https://commons.wikimedia.org/wiki/File:Scarlet_macaw_(Ara_macao_cyanopterus)_Copan.jpg) by Charles J. Sharp, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Resized for the site.
- [Bottlenose dolphin](https://commons.wikimedia.org/wiki/File:Tursiops_aduncus,_Port_River,_Adelaide,_Australia_-_2003.jpg) by Aude Steiner, [CC BY-SA 1.0](https://creativecommons.org/licenses/by-sa/1.0/). Resized for the site.
- [Sea lions at La Jolla Cove](https://commons.wikimedia.org/wiki/File:Sea_Lions_At_La_Jolla_Cove_-_32.jpg) by Jarek Tuszyński, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Resized for the site.
- [Collingwood Children's Farm](https://commons.wikimedia.org/wiki/File:Collingwood_Children%27s_Farm_-_plots_and_animals.JPG) by pfctdayelise, [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/). Resized for the site.
- [White-faced capuchin](https://commons.wikimedia.org/wiki/File:White_faced_Capuchin.jpg) by Joseph C Boone, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Resized for the site.
- [Emperor penguin](https://commons.wikimedia.org/wiki/File:Emperor_Penguin.jpg) by Pavan Nair, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Resized for the site.
