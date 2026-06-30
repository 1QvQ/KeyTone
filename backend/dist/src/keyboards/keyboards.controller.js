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
exports.KeyboardsController = void 0;
const common_1 = require("@nestjs/common");
const keyboards_service_1 = require("./keyboards.service");
const create_keyboard_dto_1 = require("./dto/create-keyboard.dto");
const update_keyboard_dto_1 = require("./dto/update-keyboard.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/get-user.decorator");
let KeyboardsController = class KeyboardsController {
    keyboardsService;
    constructor(keyboardsService) {
        this.keyboardsService = keyboardsService;
    }
    create(user, createKeyboardDto) {
        return this.keyboardsService.create(user.id, createKeyboardDto);
    }
    findAll(user) {
        return this.keyboardsService.findAll(user.id);
    }
    findOne(user, id) {
        return this.keyboardsService.findOne(user.id, id);
    }
    update(user, id, updateKeyboardDto) {
        return this.keyboardsService.update(user.id, id, updateKeyboardDto);
    }
    remove(user, id) {
        return this.keyboardsService.remove(user.id, id);
    }
};
exports.KeyboardsController = KeyboardsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_keyboard_dto_1.CreateKeyboardDto]),
    __metadata("design:returntype", void 0)
], KeyboardsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KeyboardsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], KeyboardsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_keyboard_dto_1.UpdateKeyboardDto]),
    __metadata("design:returntype", void 0)
], KeyboardsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], KeyboardsController.prototype, "remove", null);
exports.KeyboardsController = KeyboardsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('keyboards'),
    __metadata("design:paramtypes", [keyboards_service_1.KeyboardsService])
], KeyboardsController);
//# sourceMappingURL=keyboards.controller.js.map