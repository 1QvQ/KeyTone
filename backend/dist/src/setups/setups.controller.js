"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupsController = void 0;
const common_1 = require("@nestjs/common");
const setups_service_1 = require("./setups.service");
const create_setup_dto_1 = require("./dto/create-setup.dto");
const update_setup_dto_1 = require("./dto/update-setup.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/get-user.decorator");
let SetupsController = class SetupsController {
    setupsService;
    constructor(setupsService) {
        this.setupsService = setupsService;
    }
    create(user, createSetupDto) {
        return this.setupsService.create(user.id, createSetupDto);
    }
    getMetrics(user) {
        return this.setupsService.getMetrics(user.id);
    }
    findAll(user, search, brand, plate, sw, typingFeel, favourite, tag) {
        return this.setupsService.findAll(user.id, {
            search,
            brand,
            plate,
            switch: sw,
            typingFeel,
            favourite,
            tag,
        });
    }
    findOne(user, id) {
        return this.setupsService.findOne(user.id, id);
    }
    update(user, id, updateSetupDto) {
        return this.setupsService.update(user.id, id, updateSetupDto);
    }
    remove(user, id) {
        return this.setupsService.remove(user.id, id);
    }
};
exports.SetupsController = SetupsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_setup_dto_1.CreateSetupDto]),
    __metadata("design:returntype", void 0)
], SetupsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SetupsController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('brand')),
    __param(3, (0, common_1.Query)('plate')),
    __param(4, (0, common_1.Query)('switch')),
    __param(5, (0, common_1.Query)('typingFeel')),
    __param(6, (0, common_1.Query)('favourite')),
    __param(7, (0, common_1.Query)('tag')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], SetupsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SetupsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_setup_dto_1.UpdateSetupDto]),
    __metadata("design:returntype", void 0)
], SetupsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SetupsController.prototype, "remove", null);
exports.SetupsController = SetupsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('setups'),
    __metadata("design:paramtypes", [setups_service_1.SetupsService])
], SetupsController);
//# sourceMappingURL=setups.controller.js.map