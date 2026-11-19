import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmployeeBranchesService } from './employee-branches.service';

describe('EmployeeBranchesService', () => {
    let service: EmployeeBranchesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmployeeBranchesService,
                { provide: PrismaService, useValue: {} },
            ],
        }).compile();

        service = module.get<EmployeeBranchesService>(EmployeeBranchesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
