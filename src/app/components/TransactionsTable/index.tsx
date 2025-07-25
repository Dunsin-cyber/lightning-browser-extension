import Loading from "@components/Loading";
import { Nip47TransactionMetadata } from "@getalby/sdk/dist/nwc";
import {
  PopiconsArrowDownSolid,
  PopiconsArrowUpSolid,
  PopiconsXSolid,
} from "@popicons/react";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import TransactionModal from "~/app/components/TransactionsTable/TransactionModal";
import { useSettings } from "~/app/context/SettingsContext";
import { classNames, safeNpubEncode } from "~/app/utils";
import { Transaction } from "~/types";

export type Props = {
  transactions: Transaction[] | null | undefined;
  loading?: boolean;
  noResultMsg?: string;
};

export default function TransactionsTable({
  transactions,
  loading = false,
}: Props) {
  const { getFormattedSats, getFormattedInCurrency } = useSettings();
  const [modalOpen, setModalOpen] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | undefined>();
  const { t } = useTranslation("components", {
    keyPrefix: "transactions_table",
  });

  function openDetails(transaction: Transaction) {
    setTransaction(transaction);
    setModalOpen(true);
  }

  function getTransactionType(tx: Transaction): "incoming" | "outgoing" {
    return [tx.type && "sent"].includes(tx.type) ? "outgoing" : "incoming";
  }

  return (
    <div>
      {loading ? (
        <div className="w-full flex flex-col items-center">
          <Loading />
        </div>
      ) : !transactions?.length ? (
        <p className="text-gray-500 dark:text-neutral-400 text-center">
          {t("no_transactions")}
        </p>
      ) : (
        <>
          {transactions?.map((tx) => {
            const type = getTransactionType(tx);
            const typeStateText =
              type == "incoming"
                ? t("received")
                : t(
                    tx.state === "settled"
                      ? "sent"
                      : tx.state === "pending"
                      ? "sending"
                      : tx.state === "failed"
                      ? "failed"
                      : "sent"
                  );

            const metadata = tx.metadata as Nip47TransactionMetadata;
            const payerName = metadata?.payer_data?.name;
            const pubkey = metadata?.nostr?.pubkey;
            const npub = pubkey ? safeNpubEncode(pubkey) : undefined;

            const from = payerName
              ? `from ${payerName}`
              : npub
              ? `zap from ${npub.substring(0, 12)}...`
              : undefined;

            const recipientIdentifier = metadata?.recipient_data?.identifier;
            const to = recipientIdentifier
              ? `${
                  tx.state === "failed" ? "payment " : ""
                }to ${recipientIdentifier}`
              : undefined;

            return (
              <div
                key={tx.id}
                className="-mx-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-surface-02dp cursor-pointer rounded-md"
                onClick={() => openDetails(tx)}
              >
                <div className="flex gap-3 items-center">
                  <div className="flex items-center">
                    {type == "outgoing" ? (
                      tx.state === "pending" ? (
                        <div className="flex justify-center items-center bg-blue-100 dark:bg-sky-950 rounded-full w-8 h-8 animate-pulse">
                          <PopiconsArrowUpSolid className="w-5 h-5 rotate-45 text-blue-500 dark:text-sky-500 stroke-[1px] stroke-blue-500 dark:stroke-sky-500" />
                        </div>
                      ) : tx.state === "failed" ? (
                        <div className="flex justify-center items-center bg-red-100 dark:bg-rose-950 rounded-full w-8 h-8">
                          <PopiconsXSolid className="w-5 h-5 text-red-500 dark:text-rose-500 stroke-[1px] stroke-red-500 dark:stroke-rose-500" />
                        </div>
                      ) : (
                        <div className="flex justify-center items-center bg-orange-100 dark:bg-amber-950 rounded-full w-8 h-8">
                          <PopiconsArrowUpSolid className="w-5 h-5 text-orange-500 dark:text-amber-500 stroke-[1px] stroke-orange-500 dark:stroke-amber-500" />
                        </div>
                      )
                    ) : (
                      <div className="flex justify-center items-center bg-green-100 dark:bg-emerald-950 rounded-full w-8 h-8">
                        <PopiconsArrowDownSolid className="w-5 h-5 text-green-500 dark:text-teal-500 stroke-[1px] stroke-green-500 dark:stroke-teal-500" />
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden mr-3">
                    <div className="flex gap-2 text-sm font-medium text-black truncate dark:text-white items-center">
                      <p
                        className={classNames(
                          "truncate",
                          tx.state == "pending" && "animate-pulse"
                        )}
                      >
                        {typeStateText}
                        {from !== undefined && <>&nbsp;{from}</>}
                        {to !== undefined && <>&nbsp;{to}</>}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-neutral-500">
                        {tx.timeAgo}
                      </p>
                    </div>
                    {(tx.description || metadata?.comment) && (
                      <p className="truncate text-xs text-gray-600 dark:text-neutral-400">
                        {tx.description || metadata?.comment}
                      </p>
                    )}
                  </div>
                  <div className="flex ml-auto text-right space-x-3 shrink-0 dark:text-white">
                    <div>
                      <p
                        className={classNames(
                          "text-sm",
                          type == "incoming"
                            ? "text-green-600 dark:text-emerald-500"
                            : tx.state == "failed"
                            ? "text-red-600 dark:text-rose-500"
                            : "text-orange-600 dark:text-amber-600"
                        )}
                      >
                        {type == "outgoing" ? "-" : "+"}{" "}
                        {!tx.displayAmount
                          ? getFormattedSats(tx.totalAmount)
                          : getFormattedInCurrency(
                              tx.displayAmount[0],
                              tx.displayAmount[1]
                            )}
                      </p>

                      {!!tx.totalAmountFiat && (
                        <p className="text-xs text-gray-400 dark:text-neutral-600">
                          ~{tx.totalAmountFiat}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {transaction && (
            <TransactionModal
              transaction={transaction}
              isOpen={modalOpen}
              onClose={() => {
                setModalOpen(false);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
