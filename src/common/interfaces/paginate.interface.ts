import {
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ObjectLiteral,
} from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';

export interface PaginateOptions<T extends ObjectLiteral> {
  pagination: PaginationDto;
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
  relations?: FindOptionsRelations<T>;
  select?: FindOptionsSelect<T>;
  searchFields?: (keyof T)[];
}
