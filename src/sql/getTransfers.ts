type Props = {
  walletAddress: string;
};

export const nftTransfersQuery = ({ walletAddress }: Props) => {
  return `
  WITH nfttransfertowallet
     AS (SELECT nft_address      AS toContractAddress,
                nft_from_address AS transferInSourceAddress,
                nft_to_address,
                project_name     AS projectName,
                tokenid          AS tokenid,
                block_timestamp  AS transferToTimestamp,
                tx_hash          AS transferToTxHash
         FROM   flipside_prod_db.ethereum_core.ez_nft_transfers AS transfers_to
         WHERE  transfers_to.nft_to_address = Lower(
                '${walletAddress}'
                  )
                AND transfers_to.project_name IS NOT NULL
                AND transfers_to.project_name != ''
                AND transfers_to.erc1155_value IS NULL),
     nfttransferfromwallet
     AS (SELECT nft_address      AS fromContractAddress,
                nft_from_address AS fromAddress,
                nft_to_address   AS transferOutTargetAddress,
                project_name     AS fromProjectName,
                tokenid          AS fromTokenId,
                block_timestamp  AS transferFromTimestamp,
                tx_hash          AS transferFromTxHash
         FROM   flipside_prod_db.ethereum_core.ez_nft_transfers AS
                transfers_from
         WHERE  transfers_from.nft_from_address = Lower(
                        '${walletAddress}')
                AND transfers_from.project_name IS NOT NULL
                AND transfers_from.project_name != ''
                AND COALESCE(transfers_from.erc1155_value, '') = '')
SELECT fromcontractaddress,
       fromaddress,
       transferouttargetaddress,
       transferinsourceaddress,
       projectname,
       nfttransfertowallet.tokenid,
       transferfromtimestamp,
       transfertotimestamp,
       mints.mint_price_eth                         AS mint_price_eth,
       mints.tx_fee                                 AS mint_tx_fee,
       CASE
         WHEN Lower(transferinsourceaddress) = Lower(
              '0x0000000000000000000000000000000000000000') THEN 'Minted'
         WHEN Lower(transferinsourceaddress) = Lower(
              '${walletAddress}') THEN 'Sent'
         ELSE 'Received'
       END                                          AS transferToType,
       CASE
         WHEN Lower(transferouttargetaddress) IN( Lower(
              '0x0000000000000000000000000000000000000000'), Lower(
              '0x000000000000000000000000000000000000dEaD'
              ) ) THEN 'Burned'
         WHEN Lower(transferouttargetaddress) IS NULL THEN 'N/A'
         ELSE 'Transferred'
       END                                          AS transferFromType,
       '${walletAddress}' AS myAddress,
       transfertotxhash,
       transferfromtxhash,
       mint_price_usd,
       token_metadata
FROM   nfttransfertowallet
       INNER JOIN flipside_prod_db.ethereum_core.ez_nft_mints AS mints
               ON mints.nft_address = tocontractaddress
                  AND nfttransfertowallet.tokenid = mints.tokenid
       LEFT JOIN nfttransferfromwallet
              ON nfttransferfromwallet.fromcontractaddress =
                           nfttransfertowallet.tocontractaddress
                 AND nfttransferfromwallet.fromtokenid = nfttransfertowallet.tokenid
WHERE  COALESCE(mints.erc1155_value, '') = ''
ORDER  BY transfertotimestamp DESC
      `;
};
