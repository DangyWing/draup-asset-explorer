# DRAUP Asset Explorer

Hosted example: [DRAUP Asset Explorer](https://draup-asset-explorer.vercel.app/)

### How do I deploy this?
You can clone the repo by pasting this in your terminal ``git clone https://github.com/DangyWing/draup-asset-explorer.git`` then press Enter.

To run this locally ensure you are in the folder where you cloned the repo and run ``npm run dev`` then open a browser to http://localhost:3000.

### Dependencies

You will need a shroom sdk API key which you can get by buying one of the [flipside](https://flipsidecrypto.xyz/) NFTs [here](https://opensea.io/collection/flipside-shroomdk).

Once you have an api key, create an empty file name .env in your project's root directory and put api key key in your .env file assigned to ``NEXT_PUBLIC_SCHROOMDK_API_KEY``.

Your .env should look like this:

``
NEXT_PUBLIC_SHROOMDK_API_KEY=012ab34cd-5ef6-78gh-910ij-11klm1213
``

Next, you'll have to share your app's hostname with shroomdk as each API key corresponds to hostnames. Yes, even localhost:3000 :). To add your hostname(s) go [here](https://sdk.flipsidecrypto.xyz/shroomdk/apikeys).

After that you should be good to go!

Find me on twitter [DangyWing](https://twitter.com/dangywing) if you have any questions!

### Known issues & Todos:
- If an NFT moved in and out of the wallet multiple times the entered wallet date may show as after the date left wallet. Review sql query to clean the data.
- Persist data to reduce the load on API calls.
- Display NFT images on the table and explorer.
- Update the cylinders' heights based on mint price.
