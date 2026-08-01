import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TrackPageviewDto } from './dto/track-pageview.dto';

// Endpoint público (sem login) — o site institucional/landing não tem
// usuário autenticado, então o pageview precisa ser aceito sem JWT.
// Protegido só pelo ThrottlerGuard global (120 req/min por IP).
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('pageview')
  @HttpCode(HttpStatus.NO_CONTENT)
  async track(@Body() dto: TrackPageviewDto) {
    await this.analyticsService.trackPageview(dto.path, dto.visitorId);
  }
}
