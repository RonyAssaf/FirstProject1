import { Component } from '@angular/core';
import { Sidebar } from '@components/sidebar/sidebar';
import { HeaderTransactions } from '@shared/header-transactions/header-transactions';
import { Tx } from '@components/transactions-row/transaction.interface';
import { WalletTransferMenu } from './wallet-transfer-menu/wallet-transfer-menu';
import { Test1 } from './test-1/test-1';
import { Test2 } from './test-2/test-2';
import { RouterOutlet } from '@angular/router';
import { SendWalletTransfer } from './wallet-transfer-menu/send-wallet-transfer/send-wallet-transfer';

@Component({
  selector: 'app-transfers',
  imports: [Sidebar, HeaderTransactions, WalletTransferMenu, Test1, Test2, RouterOutlet],
  templateUrl: './transfers.html',
  styleUrl: './transfers.scss',
})
export class Transfers {}
