import { formatLocale, format } from "d3";

const brCurrency = formatLocale({
  decimal: ",",
  thousands: ".",
  grouping: [3],
  currency: ["R$ ", ""]
}).format("$,.2f");

export default brCurrency;
