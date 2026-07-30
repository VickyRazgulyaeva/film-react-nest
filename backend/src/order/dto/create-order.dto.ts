export class OrderTicketDto {
  film: string;
  session: string;
  row: number;
  seat: number;
  price: number;
}

export class CreateOrderDto {
  email: string;
  phone: string;
  tickets: OrderTicketDto[];
}
