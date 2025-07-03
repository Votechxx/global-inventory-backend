import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
    @ApiPropertyOptional({
        description: 'Page number',
        required: false,
    })
    @IsInt()
    @Min(1) // Page should start from 1
    @IsOptional()
    @Type(() => Number)
    page?: number;

    @ApiPropertyOptional({
        description: 'Page size (max 100)',
        required: false,
    })
    @IsInt()
    @Min(1) // Limit should be at least 1
    @Max(100) // Limit should not exceed 100
    @IsOptional()
    @Type(() => Number)
    limit?: number; // Ensure it's a number
}
