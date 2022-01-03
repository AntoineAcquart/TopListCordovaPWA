![OS](https://badgen.net/badge/OS/Android?icon=https://raw.githubusercontent.com/androiddevnotes/awesome-android-kotlin-apps/master/assets/android.svg&color=3ddc84)
![OS](https://badgen.net/badge/OS/IOS?https://img.shields.io/badge/iOS-000000)
![BROWSER](https://badgen.net/badge/BROWSER/ALL?https://img.shields.io/badge/browser&color=ff8226)
# Top Creator

<p align="center">
  <img src="www/img/logo.png" alt="App vide" height="250">
</p>

Ce projet a été réalisé avec [Cordova](https://cordova.apache.org/).

Il inclu les plugins suivants :

- [file](https://cordova.apache.org/docs/en/10.x/reference/cordova-plugin-file/index.html)
- [camera](https://cordova.apache.org/docs/en/10.x/reference/cordova-plugin-camera/index.html)
- [inappbrowser](https://cordova.apache.org/docs/en/10.x/reference/cordova-plugin-inappbrowser/index.html)
- [splashscreen](https://cordova.apache.org/docs/en/10.x/reference/cordova-plugin-splashscreen/index.html)
- [screen-orientation](https://cordova.apache.org/docs/en/10.x/reference/cordova-plugin-screen-orientation/index.html)

⚠️ Les plugins camera et file ne sont pas compatibles sur android : Un bug connu empêche d'utiliser les `cdvfile` dans les versions de plateforme > 10, or le plugin camera nécessite une version >= 10 pour fonctionner 

> https://github.com/apache/cordova-android/issues/1361

## Lancer le projet 

### PWA

Sur Visual Studio Code ouvrir le dossier `/www`, clique droit sur le fichier `index.html` puis `Open with Live Server` (l'extension [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) est necessaire)

### Browser

Sur Visual Studio Code ouvrir le dossier racine

> cordova add platform browser

> cordova emulate browser


### Android

Sur Visual Studio Code ouvrir le dossier racine

> cordova add platform android

> cordova run android

## Fonctionnement

L'application permet de créer des "items", de leur atribuer un nom, une description, une image et une position dans le classement.

<p align="center">
  <img src="screenshots/create_item_app.jpg" alt="Créer un item" height="500" margin="1">
  <img src="screenshots/create_item_fullfiled_app.jpg" alt="Créer un item" height="500" margin="1">
  <img src="screenshots/one_item_app.jpg" alt="liste" height="500" margin="1">
</p>


Il est également possible de modifier l'item et sa position dans le classement, ainsi que de le supprimer.

<p align="center">
  <img src="screenshots/edit_item_app.jpg" alt="liste" height="500" margin="1">
  <img src="screenshots/two_items_app.jpg" alt="liste" height="500" margin="1">
</p>
