import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsString()
  search?: string;

  // --- Filtros de fecha ---
  @IsOptional()
  @IsDateString()
  dateFrom?: string; // ejemplo: "2025-01-01"

  @IsOptional()
  @IsDateString()
  dateTo?: string; // ejemplo: "2025-12-31"

  /**
   * Campo por el cual se filtrará la fecha.
   * Por defecto: "createdAt"
   */
  @IsOptional()
  @IsString()
  dateField?: string = 'createdAt';
}
