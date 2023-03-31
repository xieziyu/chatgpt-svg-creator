import * as Browser from 'webextension-polyfill';

async function openAppPage() {
  const tabs = await Browser.tabs.query({});
  const url = Browser.runtime.getURL('/index.html');
  const tab = tabs.find(tab => tab.url?.startsWith(url));
  if (tab) {
    await Browser.tabs.update(tab.id, { active: true });
    return;
  }
  await Browser.tabs.create({ url: 'index.html' });
}

Browser.action.onClicked.addListener(() => {
  openAppPage();
});

Browser.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    openAppPage();
  }
});
