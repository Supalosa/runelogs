import { createContext } from "react";
import { DEFAULT_LOG_FILTER } from "../../models/Filter";

export const FilterContext = createContext(DEFAULT_LOG_FILTER);