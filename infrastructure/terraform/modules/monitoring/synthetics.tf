# Monitoring Module - CloudWatch Synthetics Canaries
# FR-22: The system shall be deployed on AWS Infrastructure.
# Infrastructure Phase 7 - Monitoring
#
# Creates Synthetics canaries for uptime monitoring:
# - Homepage availability check
# - API health endpoint check
#
# Note: Canaries incur costs - approximately $0.0012 per run
# With 5-minute intervals, each canary costs ~$0.35/month

#------------------------------------------------------------------------------
# IAM Role for Synthetics Canaries
#------------------------------------------------------------------------------
resource "aws_iam_role" "synthetics" {
  count = var.enable_synthetics ? 1 : 0
  name  = "${var.project_name}-${var.environment}-synthetics"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-synthetics-role"
  })
}

resource "aws_iam_role_policy" "synthetics" {
  count = var.enable_synthetics ? 1 : 0
  name  = "${var.project_name}-${var.environment}-synthetics-policy"
  role  = aws_iam_role.synthetics[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.synthetics[0].arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetBucketLocation"
        ]
        Resource = aws_s3_bucket.synthetics[0].arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:CreateLogGroup"
        ]
        Resource = "arn:aws:logs:${local.region}:${local.account_id}:log-group:/aws/lambda/cwsyn-*"
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "cloudwatch:namespace" = "CloudWatchSynthetics"
          }
        }
      },
      {
        Effect = "Allow"
        Action = [
          "xray:PutTraceSegments"
        ]
        Resource = "*"
      }
    ]
  })
}

#------------------------------------------------------------------------------
# S3 Bucket for Canary Artifacts
#------------------------------------------------------------------------------
resource "aws_s3_bucket" "synthetics" {
  count  = var.enable_synthetics ? 1 : 0
  bucket = "${var.project_name}-${var.environment}-synthetics-${local.account_id}"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-synthetics"
  })
}

resource "aws_s3_bucket_lifecycle_configuration" "synthetics" {
  count  = var.enable_synthetics ? 1 : 0
  bucket = aws_s3_bucket.synthetics[0].id

  rule {
    id     = "cleanup-artifacts"
    status = "Enabled"

    expiration {
      days = 30
    }
  }
}

resource "aws_s3_bucket_public_access_block" "synthetics" {
  count  = var.enable_synthetics ? 1 : 0
  bucket = aws_s3_bucket.synthetics[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

#------------------------------------------------------------------------------
# Homepage Canary
# Checks that the homepage loads successfully
#------------------------------------------------------------------------------
resource "aws_synthetics_canary" "homepage" {
  count                = var.enable_synthetics ? 1 : 0
  name                 = "${var.project_name}-${var.environment}-home"
  artifact_s3_location = "s3://${aws_s3_bucket.synthetics[0].id}/homepage/"
  execution_role_arn   = aws_iam_role.synthetics[0].arn
  handler              = "index.handler"
  runtime_version      = "syn-nodejs-puppeteer-9.1"
  start_canary         = true

  schedule {
    expression = "rate(${var.synthetics_rate_minutes} minutes)"
  }

  run_config {
    timeout_in_seconds = 60
    active_tracing     = var.enable_xray
  }

  zip_file = data.archive_file.homepage_canary[0].output_base64sha256 != "" ? data.archive_file.homepage_canary[0].output_path : null

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-homepage-canary"
  })

  depends_on = [aws_s3_bucket.synthetics]
}

# Create the canary script as a local file, then zip it
resource "local_file" "homepage_canary_script" {
  count    = var.enable_synthetics ? 1 : 0
  filename = "${path.module}/canary-scripts/homepage/nodejs/node_modules/index.js"
  content  = <<-EOT
const { URL } = require('url');
const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');

const pageLoadBlueprint = async function () {
    const url = '${var.app_url}/';

    log.info('Loading page: ' + url);

    let page = await synthetics.getPage();

    const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
    });

    const statusCode = response.status();
    log.info('Status code: ' + statusCode);

    if (statusCode !== 200) {
        throw new Error('Homepage returned status: ' + statusCode);
    }

    // Check for page title
    const title = await page.title();
    log.info('Page title: ' + title);

    log.info('Homepage loaded successfully');
};

exports.handler = async () => {
    return await pageLoadBlueprint();
};
EOT
}

data "archive_file" "homepage_canary" {
  count       = var.enable_synthetics ? 1 : 0
  type        = "zip"
  source_dir  = "${path.module}/canary-scripts/homepage"
  output_path = "${path.module}/canary-scripts/homepage.zip"
  depends_on  = [local_file.homepage_canary_script]
}

#------------------------------------------------------------------------------
# API Health Canary
# Checks the /health endpoint returns healthy status
#------------------------------------------------------------------------------
resource "aws_synthetics_canary" "api_health" {
  count                = var.enable_synthetics ? 1 : 0
  name                 = "${var.project_name}-${var.environment}-api"
  artifact_s3_location = "s3://${aws_s3_bucket.synthetics[0].id}/api-health/"
  execution_role_arn   = aws_iam_role.synthetics[0].arn
  handler              = "index.handler"
  runtime_version      = "syn-nodejs-puppeteer-9.1"
  start_canary         = true

  schedule {
    expression = "rate(${var.synthetics_rate_minutes} minutes)"
  }

  run_config {
    timeout_in_seconds = 30
    active_tracing     = var.enable_xray
  }

  zip_file = data.archive_file.api_health_canary[0].output_base64sha256 != "" ? data.archive_file.api_health_canary[0].output_path : null

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-api-health-canary"
  })

  depends_on = [aws_s3_bucket.synthetics]
}

resource "local_file" "api_health_canary_script" {
  count    = var.enable_synthetics ? 1 : 0
  filename = "${path.module}/canary-scripts/api-health/nodejs/node_modules/index.js"
  content  = <<-EOT
const https = require('https');
const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');

const apiHealthCheck = async function () {
    const url = '${var.app_url}${var.health_check_path}';

    log.info('Checking API health: ' + url);

    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname,
            method: 'GET',
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', chunk => { data += chunk; });

            res.on('end', () => {
                log.info('Status code: ' + res.statusCode);
                log.info('Response: ' + data);

                if (res.statusCode !== 200) {
                    reject(new Error('Health check returned status: ' + res.statusCode));
                    return;
                }

                try {
                    const json = JSON.parse(data);
                    if (json.status !== 'healthy') {
                        reject(new Error('Health check status: ' + json.status));
                        return;
                    }
                    log.info('API health check passed');
                    resolve();
                } catch (e) {
                    reject(new Error('Failed to parse health response: ' + e.message));
                }
            });
        });

        req.on('error', (e) => {
            reject(new Error('Health check request failed: ' + e.message));
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Health check request timed out'));
        });

        req.end();
    });
};

exports.handler = async () => {
    return await apiHealthCheck();
};
EOT
}

data "archive_file" "api_health_canary" {
  count       = var.enable_synthetics ? 1 : 0
  type        = "zip"
  source_dir  = "${path.module}/canary-scripts/api-health"
  output_path = "${path.module}/canary-scripts/api-health.zip"
  depends_on  = [local_file.api_health_canary_script]
}

#------------------------------------------------------------------------------
# Canary Failure Alarms
#------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "canary_homepage_failed" {
  count               = var.enable_synthetics ? 1 : 0
  alarm_name          = "${local.alarm_prefix}-canary-homepage-failed"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "SuccessPercent"
  namespace           = "CloudWatchSynthetics"
  period              = 300
  statistic           = "Average"
  threshold           = 100
  alarm_description   = "Homepage canary is failing"
  treat_missing_data  = "breaching"

  dimensions = {
    CanaryName = aws_synthetics_canary.homepage[0].name
  }

  alarm_actions = [aws_sns_topic.critical.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name = "${local.alarm_prefix}-canary-homepage-failed"
  })
}

resource "aws_cloudwatch_metric_alarm" "canary_api_health_failed" {
  count               = var.enable_synthetics ? 1 : 0
  alarm_name          = "${local.alarm_prefix}-canary-api-health-failed"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "SuccessPercent"
  namespace           = "CloudWatchSynthetics"
  period              = 300
  statistic           = "Average"
  threshold           = 100
  alarm_description   = "API health canary is failing"
  treat_missing_data  = "breaching"

  dimensions = {
    CanaryName = aws_synthetics_canary.api_health[0].name
  }

  alarm_actions = [aws_sns_topic.critical.arn]
  ok_actions    = [aws_sns_topic.info.arn]

  tags = merge(local.common_tags, {
    Name = "${local.alarm_prefix}-canary-api-health-failed"
  })
}
