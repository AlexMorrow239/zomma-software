import { IsEnum } from 'class-validator';

import { BudgetRange } from '@/common/enums';

export class BudgetDto {
  @IsEnum(BudgetRange, {
    message:
      'Budget range must be one of: below5k, 5k-10k, 10k-25k, 25k-50k, above50k',
  })
  budgetRange: BudgetRange;
}
