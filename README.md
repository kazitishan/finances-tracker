# Finances Tracker

Store all of your financial information in one place, locally. Your data is saved to a local `private/info.json` file and never leaves your machine.

## Setup

### Quick start (if you already have Node.js and Git)

```
git clone https://github.com/kazitishan/finances-tracker.git
cd finances-tracker
npm install
npm run setup
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Full setup (starting from nothing)

#### 1. Install Node.js

1. Go to [https://nodejs.org](https://nodejs.org) and download the **LTS** installer for your operating system.
2. Run the installer and accept the defaults.

#### 2. Install Git

- **Windows:** download the installer from [https://git-scm.com/downloads](https://git-scm.com/downloads) and accept the defaults.
- **Mac:** run `git --version` in the terminal. If Git isn't installed, macOS will offer to install it for you. Click **Install** and wait for it to finish.

#### 3. Download the project

In your terminal, run:

```
git clone https://github.com/kazitishan/finances-tracker.git
```

This creates a `finances-tracker` folder wherever your terminal is currently located (by default, your home folder). Then move into it:

```
cd finances-tracker
```

#### 5. Install the project's dependencies

```
npm install
```

#### 6. Run the setup script

This creates the `private/info.json` file used to store your information:

```
npm run setup
```

#### 7. Start the app

```
npm run dev
```

Leave this terminal window open while you use the app. Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Using the app again after setup

1. Open a terminal and move into the project folder (`cd finances-tracker`).
2. Run `npm run dev`.
3. Open [http://localhost:3000](http://localhost:3000).

To stop the app, simply close the tab.

## Updating

To get the latest version of the app:

```
git pull
npm install
```
